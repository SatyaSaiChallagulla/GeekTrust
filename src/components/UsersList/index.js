import {Component} from 'react'

import Pagination from 'react-js-pagination'
import Loader from 'react-loader-spinner'
import UserDetails from '../UserDetails'
import apiStatusConstants from '../../constants/ApiStatusConstants'

import './index.css'

const maxNumberOfUserPerPage = 10

class UsersList extends Component {
  state = {
    usersList: [],
    usersListApiStatus: apiStatusConstants.initial,
    searchInput: '',
    activePage: 1,
    offset: 0,
    limit: maxNumberOfUserPerPage,
  }

  componentDidMount() {
    this.getUsersList()
  }

  // to fetch the usersList using api
  getUsersList = async () => {
    this.setState({usersListApiStatus: apiStatusConstants.inProgress})

    const usersApiUrl =
      'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json'
    const options = {
      method: 'GET',
    }

    const response = await fetch(usersApiUrl, options)
    console.log(response)
    if (response.ok === true) {
      const fetchedData = await response.json()

      const updatedData = fetchedData.map(eachUser => ({
        id: eachUser.id,
        name: eachUser.name,
        email: eachUser.email,
        role: eachUser.role,
        isChecked: false,
      }))

      this.setState({
        usersList: updatedData,
        usersListApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({usersListApiStatus: apiStatusConstants.failure})
    }
  }

  // deleting the user from Users List

  deleteUser = id => {
    const {usersList} = this.state
    console.log(id)

    const newUsersList = usersList.filter(eachUser => eachUser.id !== id)

    this.setState({usersList: newUsersList})
  }

  // deleting the selected users from Users List
  onDeleteSelectedUsers = () => {
    const {usersList} = this.state
    // updating the users list after deleting the users
    const newUsersList = usersList.filter(
      eachUser => eachUser.isChecked !== true,
    )
    this.setState({usersList: newUsersList})
  }

  onChangeSearchInput = event => {
    this.setState({searchInput: event.target.value})
  }

  onSelectCheckbox = id => {
    this.setState(prevState => ({
      usersList: prevState.usersList.map(eachUser => {
        if (eachUser.id === id) {
          return {...eachUser, isChecked: !eachUser.isChecked}
        }
      }),
    }))
  }

  // retrying to fetch the UserList
  retryFetchingData = () => {
    this.getUsersList()
  }

  //to show the spinner until fetching the results

  renderLoadingView = () => (
    <div className="usersList-loader-container">
      <Loader type="TailSpin" color="#0b69ff" height="30" width="30" />
    </div>
  )

  //api error handling
  renderFailureView = () => (
    <div className="failure-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        className="failure-image"
        alt="failure"
      />
      <h1>Oops! Something went Wrong</h1>
      <button
        type="button"
        className="retry-button"
        onClick={this.retryFetchingData}
      >
        Retry
      </button>
    </div>
  )

  handlingPageChange(pageNumber) {
    if (pageNumber > 1) {
      this.setState({
        activePage: pageNumber,
        offset: (pageNumber - 1) * maxNumberOfUserPerPage,
        limit: pageNumber * maxNumberOfUserPerPage,
      })
    } else {
      this.setState({
        page: pageNumber,
        activePage: pageNumber,
        offset: 0,
        limit: 10,
      })
    }
  }

  //to show the Users List after successful handling of API
  renderUsersList = () => {
    const {usersList, searchInput, offset, limit, activePage} = this.state
    const searchResults = usersList.filter(
      eachUser =>
        eachUser.id > offset &&
        eachUser.id <= limit &&
        (eachUser.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          eachUser.email.toLowerCase().includes(searchInput.toLowerCase()) ||
          eachUser.role.toLowerCase().includes(searchInput.toLowerCase())),
    )

    const emptyUsersList = searchResults.length === 0
    return (
      <>
        {emptyUsersList ? (
          <h1 className="no-data-heading">
            No Data Found in this Page {activePage}
          </h1>
        ) : (
          <table className="users-table">
            <thead>
              <tr className="users-table-header">
                <th className="users-table-header-cell">
                  <input type="checkbox" />
                </th>
                <th className="users-table-header-cell">Name</th>
                <th className="users-table-header-cell">Email</th>
                <th className="users-table-header-cell">Role</th>
                <th className="users-table-header-cell">Actions</th>
              </tr>
            </thead>

            <tbody>
              {searchResults.map(eachUser => (
                <UserDetails
                  key={eachUser.id}
                  userDetails={eachUser}
                  deleteUser={this.deleteUser}
                  onSelectCheckbox={this.onSelectCheckbox}
                />
              ))}
            </tbody>
          </table>
        )}
        <div className="pagination-container">
          <button
            type="button"
            className="delete-selected-button"
            onClick={this.onDeleteSelectedUsers}
          >
            Delete Selected
          </button>
          <Pagination
            activePage={this.state.activePage}
            itemsCountPerPage={10}
            totalItemsCount={usersList.length}
            pageRangeDisplayed={Math.ceil(usersList.length / 10)}
            onChange={this.handlingPageChange.bind(this)}
            innerClass="pagination"
            activeClass="active-item"
            itemClass="current-page"
            itemClassNext="next-item"
            disabledClass="inactive-item"
            linkClass="default-link"
            activeLinkClass="active-link"
            linkClassNext="next-link"
          />
        </div>
      </>
    )
  }

  //using switch case to show the content in Web page

  renderView = () => {
    const {usersListApiStatus} = this.state
    switch (usersListApiStatus) {
      case apiStatusConstants.success:
        return this.renderUsersList()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      default:
        return this.renderLoadingView()
    }
  }

  render() {
    const {searchInput} = this.state
    return (
      <div className="users-list-container">
        <input
          type="search"
          placeholder="Search by name,email or role"
          value={searchInput}
          onChange={this.onChangeSearchInput}
          className="search-input"
        />
        {this.renderView()}
      </div>
    )
  }
}
export default UsersList
