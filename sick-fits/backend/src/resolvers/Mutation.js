const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check that they are logged in.

    const item = await ctx.db.mutation.createItem({
      data: {
        ...args, // short hand for { title: args.title, description: args.description, etc. }
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
  }
};

module.exports = Mutations;
