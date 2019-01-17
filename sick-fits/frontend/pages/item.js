import SingleItem from '../components/SingleItem';

const Item = props => console.log('props query', props.query) || (
  <div>
    <SingleItem id={props.query.id} />
  </div>
);

export default Item;
