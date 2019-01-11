import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE'
];

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => console.log(data) || (
      <div>
        <Error error={error} />
        <div>
          <h2>Manage Permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                { possiblePermissions.map(p => (
                  <th key={p}>{p}</th>
                )) }
                <th>👇</th>
              </tr>
            </thead>
            <tbody>
              { data.users.map(user => <UserPermissions key={user.id} user={user} />) }
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
);

class UserPermissions extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired,
  };

  state = {
    // it is safe to use props to populate initial state in this case because we are "seeding" the data.
    // in other words, the initial data is coming from props
    // and anytime permissions are updated *inside* of the User component its state is updated.
    permissions: this.props.user.permissions,
  };

  handlePermissionChange = e => {
    const checkbox = e.target;
    // Create a copy of the current permissions.
    let updatedPermissions = [...this.state.permissions];
    // Determine whether permission should be added or removed.
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = updatedPermissions.filter(permission => permission !== checkbox.value);
    }
    // Update state with updated permissions.
    this.setState({ permissions: updatedPermissions });
  };

  render() {
    const { user } = this.props;
    return (
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        { possiblePermissions.map(p => (
          <td key={p}>
            <label htmlFor={`${user.id}-permission-${p}`}>
              <input
                type="checkbox"
                checked={this.state.permissions.includes(p)}
                value={p}
                onChange={this.handlePermissionChange}
              />
            </label>
          </td>
        )) }
        <td>
          <SickButton>Update</SickButton>
        </td>
      </tr>
    );
  }
}

export default Permissions;
