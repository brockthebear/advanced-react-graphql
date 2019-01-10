import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Item from './Item';

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY {
    items {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`;

const Center = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`;

class Items extends Component {
  render() {
    return (
      <Center>
        <p>Items!</p>
        <Query query={ALL_ITEMS_QUERY}>
          {({ data, error, loading }) => {
            {/*
              data, error, loading are destructured from payload object.
              {({ data, error, loading }) => {...}} is equivalent to
              { payload => { const { data, error, loading } = payload } }
            */}
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error: {error.message}</p>;
            return <ItemsList>{ data.items.map(i => <Item key={i.id} item={i} />) }</ItemsList>
          }}
        </Query>
      </Center>
    )
  }
};

export default Items;
export { ALL_ITEMS_QUERY };
