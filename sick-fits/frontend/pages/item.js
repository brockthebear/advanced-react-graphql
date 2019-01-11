import SingleItem from '../components/SingleItem';

const Item = props => (
  <div>
    <SingleItem id={props.query.item} />
  </div>
);

export default Item;
