import SingleItem from '../components/SingleItem';

const Item = props => console.log(props) || (
  <div>
    <SingleItem id={props.query.item} />
  </div>
);

export default Item;
