const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    // check if there is a current user id in the request.
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user({
      where: { id: ctx.request.userId },
    }, info);
  },
  async users(parent, args, ctx, info) {
    // 1. Check if the user is logged in.
    if (!ctx.request.userId) {
      throw new Error('You must be logged in.');
    }
    // 2. Check that the user has the permissions to query for all users.
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    // 3. If user has permission, query all the users
    return ctx.db.query.users({}, info);
  }
};

module.exports = Query;
