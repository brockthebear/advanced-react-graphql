import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';
import NProgress from 'nprogress';
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';

function totalItems(cart) {
	return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}

class TakeMyMoney extends React.Component {
	onToken = res => {
		console.log('onToken()');
		console.log(res);
	};

	render() {
		return (
			<User>
				{({ data: { me }}) => (
					<StripeCheckout
						amount={calcTotalPrice(me.cart)}
						name="Grated"
						description={`Order of ${totalItems(me.cart)} items`}
						image={me.cart[0].item && me.cart[0].item.image}
						stripeKey="pk_test_yjDVVd6uOHyjZuqJyB4mFV3r"
						currency="USD"
						email={me.email}
						token={res => this.onToken(res)}
					>
						{this.props.children}
					</StripeCheckout>
				)}
			</User>
		);
	};
}

export default TakeMyMoney;

