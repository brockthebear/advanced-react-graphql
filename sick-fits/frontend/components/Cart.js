import React from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import SickButton from './styles/SickButton';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';

// `@client` lets apollo know that the data is client side and it can be retrieved directly from the local store.
const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

const Cart = () => {
  return (
    <Mutation mutation={TOGGLE_CART_MUTATION}>
      {toggleCart => (
        <Query query={LOCAL_STATE_QUERY}>
          {({ data }) => (
            <CartStyles open={data.cartOpen}>
              <header>
                <CloseButton title="close" onClick={toggleCart}>&times;</CloseButton>
                <Supreme>Your Cart</Supreme>
                <p>You have __ items in your cart.</p>
              </header>

              <footer>
                <p>$10.10</p>
                <SickButton>Checkout</SickButton>
              </footer>
            </CartStyles>
          )}
        </Query>
      )}
    </Mutation>
  );
}

export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION };
export default Cart;
