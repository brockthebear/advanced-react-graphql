const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: check that they are logged in.

    const item = await ctx.db.mutation.createItem({
      data: {
        ...args, // short hand for { title: args.title, description: args.description, etc. }
      }
    }, info);

    return item;
  }
};

module.exports = Mutations;
