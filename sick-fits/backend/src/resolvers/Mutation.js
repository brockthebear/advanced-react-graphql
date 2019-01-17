const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, prettifyEmail } = require('../mail');
const { hasPermission } = require('../utils');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that.");
    }

    const item = await ctx.db.mutation.createItem({
      data: {
        // create a relationship between the item and the user.
        user: {
          connect: {
            id: ctx.request.userId,
          }
        },
        ...args,
      }
    }, info);

    return item;
  },
  updateItem(parent, args, ctx, info) {
    // take a copy of the updates.
    const updates = { ...args };
    // remove the ID from the updates (bc ids cannot be updated).
    delete updates.id;
    // run the update method.
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. Find the item
    const item = await ctx.db.query.item({ where }, `{ id title user { id } }`);
    // 2. Check that the user either owns that item *OR* the user has the ITEMDELETE permission.
    const userOwnsItem = item.user.id === ctx.request.userId;
    // To check that user has permission, loop over all of the user's permission and check if at least one is true.
    const userCanDelete = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission));
    if (!userOwnsItem && !userCanDelete) {
      throw new Error("You do not have permission that operation.");
    }
    // 3. Delete it!
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    // standardize the email address to all lower case
    args.email = args.email.toLowerCase();
    // hash the password
    const password = await bcrypt.hash(args.password, 10); // 10 refers to the length of the "salt". the salt makes the generation unique.
    // create the user in the database.
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] },
      },
    }, info);
    // create the JWT for the user.
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set the JWT as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // finally, return the user to the browser.
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // 1. check if there is a user with that email
    const user = await ctx.db.query.user({
      where: { email }
    });
    if (!user) {
      throw new Error(`No such user found for email: ${email}`);
    }
    // 2. check that the password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid Password!');
    }
    // 3. generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. set cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // 5. return the user
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: "Successfully logged out."};
  },
  async requestReset(parent, args, ctx, info) {
    // 1. Check if the user is real.
    const user = await ctx.db.query.user({
      where: { email: args.email }
    });
    if (!user) {
      throw new Error(`No such user found for email: ${args.email}`);
    }
    // 2. Set a reset token and expiry on that user.
    const asyncRandomBytes = promisify(randomBytes);
    const resetToken = (await asyncRandomBytes(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour from time of creation
    await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    // 3. Email the user the reset token.
    const mailRes = await transport.sendMail({
      from: 'brock.boren@gmail.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: prettifyEmail(`
        Your password reset token is here!
        \n\n
        <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>
      `)
    });
    // 4. Return message.
    return { message: "Reset request was successful." };
  },
  async resetPassword(parent, args, ctx, info) {
    // 1. Check if the passwords match.
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords do no match.");
    }
    // 2. Check if the reset token is legitimate.
    // 3. Check if the reset token is expired.
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error("This token is either invalid or expired.");
    }
    // 4. Hash the new password.
    const password = await bcrypt.hash(args.password, 10);
    // 5. Save the new password to the user and remove old reset token fields.
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    // 6. Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // 7. Set JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // 8. Return the new User.
    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    // 1. Check that the user is logged in.
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that.");
    }
    // 2. Query the current user.
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId,
        },
      },
      info
    );
    // 3. Check that the user has permission to perform operation.
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    // 4. Update the permissions.
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            // { permissions: { set: { value } } } has to be used here instead of
            // { permissions: args.permissions } because permissions is its own Enum.
            set: args.permissions,
          }
        },
        where: {
          // use args.userId instead of ctx.request.userId
          // because the user making the change might not be the user
          // that the change is being applied to.
          id: args.userId,
        },
      },
      info
    );
  },
  async addToCart(parent, args, ctx, info) {
    const { userId } = ctx.request;
    // 1. Make sure the user is signed in.
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that.");
    }
    // 2. Query the users current cart.
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    });
    // 3. Check if that item is already in their cart (and increment by 1 if it is).
    if (existingCartItem) {
      console.log('This item is already in the cart');
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      }, info);
    }
    // 4. If the item is not already in their cart, create a new CartItem for that user.
    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: userId },
        },
        item: {
          connect: { id: args.id },
        },
      }
    }, info);
  }
};

module.exports = Mutations;
