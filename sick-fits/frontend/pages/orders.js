import OrderList from '../components/OrderList';
import PleaseSignIn from '../components/PleaseSignIn';

const OrdersPage = props => (
  <div>
    <PleaseSignIn>
      <OrderList />
    </PleaseSignIn>
  </div>
);

export default OrdersPage;
