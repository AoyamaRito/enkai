import React, { useState, useReducer, useEffect } from 'react';

function UserManagementTable() {
  // --- Data ---
  const initialUsers = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'Inactive' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Viewer', status: 'Active' },
    { id: 4, name: 'David Miller', email: 'david@example.com', role: 'Editor', status: 'Active' },
    { id: 5, name: 'Eve Wilson', email: 'eve@example.com', role: 'Viewer', status: 'Inactive' },
    { id: 6, name: 'Grace Taylor', email: 'grace@example.com', role: 'Admin', status: 'Active' },
    { id: 7, name: 'Henry Anderson', email: 'henry@example.com', role: 'Editor', status: 'Inactive' },
    { id: 8, name: 'Ivy Thomas', email: 'ivy@example.com', role: 'Viewer', 'status': 'Active' },
    { id: 9, name: 'Jack Jackson', email: 'jack@example.com', role: 'Editor', status: 'Active' },
    { id: 10, name: 'Kelly White', email: 'kelly@example.com', role: 'Viewer', status: 'Inactive' },
    { id: 11, name: 'Liam Harris', email: 'liam@example.com', role: 'Admin', status: 'Active' },
    { id: 12, name: 'Mia Martin', email: 'mia@example.com', role: 'Editor', status: 'Inactive' },
    { id: 13, name: 'Noah Thompson', email: 'noah@example.com', role: 'Viewer', status: 'Active' },
    { id: 14, name: 'Olivia Garcia', email: 'olivia@example.com', role: 'Editor', status: 'Active' },
    { id: 15, name: 'Peter Rodriguez', email: 'peter@example.com', role: 'Viewer', status: 'Inactive' },
  ];

  // --- Types (Inline) ---
  /**
   * @typedef {object} User
   * @property {number} id
   * @property {string} name
   * @property {string} email
   * @property {string} role
   * @property {string} status
   */

  /**
   * @typedef {object} Action
   * @property {string} type
   * @property {any} payload
   */


  // --- State Management (useReducer) ---
  const reducer = (state, action) => {
    switch (action.type) {
      case 'SET_USERS':
        return { ...state, users: action.payload };
      case 'SET_SEARCH_TERM':
        return { ...state, searchTerm: action.payload };
      case 'SET_FILTER_ROLE':
        return { ...state, filterRole: action.payload };
      case 'SET_SELECTED_USERS':
        return { ...state, selectedUsers: action.payload };
      case 'SET_CURRENT_PAGE':
        return { ...state, currentPage: action.payload };
      case 'SET_USER_DETAIL':
        return {...state, userDetail: action.payload}
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    users: initialUsers,
    searchTerm: '',
    filterRole: 'all',
    selectedUsers: [],
    currentPage: 1,
    itemsPerPage: 5,
    userDetail: null,
  });

  // --- Derived State (Memoization would be overkill here) ---
  const filteredUsers = state.users.filter(user => {
    const searchTermMatch = user.name.toLowerCase().includes(state.searchTerm.toLowerCase()) || user.email.toLowerCase().includes(state.searchTerm.toLowerCase());
    const roleMatch = state.filterRole === 'all' || user.role === state.filterRole;
    return searchTermMatch && roleMatch;
  });

  const totalPages = Math.ceil(filteredUsers.length / state.itemsPerPage);
  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const endIndex = startIndex + state.itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const isAllSelected = paginatedUsers.length > 0 && paginatedUsers.every(user => state.selectedUsers.includes(user.id));


  // --- Event Handlers ---
  const handleSearchChange = (event) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: event.target.value });
    dispatch({ type: 'SET_CURRENT_PAGE', payload: 1 }); // Reset page on search
  };

  const handleFilterChange = (event) => {
    dispatch({ type: 'SET_FILTER_ROLE', payload: event.target.value });
    dispatch({ type: 'SET_CURRENT_PAGE', payload: 1 }); // Reset page on filter
  };

  const handleSelectUser = (userId) => {
    let newSelectedUsers = [...state.selectedUsers];
    if (state.selectedUsers.includes(userId)) {
      newSelectedUsers = state.selectedUsers.filter(id => id !== userId);
    } else {
      newSelectedUsers.push(userId);
    }
    dispatch({ type: 'SET_SELECTED_USERS', payload: newSelectedUsers });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all
      const unselectIds = paginatedUsers.map(user => user.id);
      const newSelectedUsers = state.selectedUsers.filter(id => !unselectIds.includes(id));

      dispatch({ type: 'SET_SELECTED_USERS', payload: newSelectedUsers });
    } else {
      // Select all
      const newSelectedUsers = [...state.selectedUsers, ...paginatedUsers.map(user => user.id)].filter((v, i, a) => a.indexOf(v) === i); //dedupe
      dispatch({ type: 'SET_SELECTED_USERS', payload: newSelectedUsers });
    }
  };


  const handlePageChange = (newPage) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: newPage });
  };

  const handleBulkDelete = () => {
    const newUsers = state.users.filter(user => !state.selectedUsers.includes(user.id));
    dispatch({ type: 'SET_USERS', payload: newUsers });
    dispatch({ type: 'SET_SELECTED_USERS', payload: [] });
  };

  const handleOpenDetail = (user) => {
    dispatch({type: 'SET_USER_DETAIL', payload: user});
  }

  const handleCloseDetail = () => {
    dispatch({type: 'SET_USER_DETAIL', payload: null});
  }


  // --- Utility Functions (Copied, not shared) ---
  const range = (start, end) => { // Example of a utility function
    return Array.from({ length: (end - start) + 1 }, (_, i) => start + i);
  };


  // --- Render ---
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* Search and Filter */}
      <div className="flex items-center mb-4 space-x-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={state.searchTerm}
          onChange={handleSearchChange}
        />
        <select
          className="shadow appearance-none border rounded w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={state.filterRole}
          onChange={handleFilterChange}
        >
          <option value="all">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td className="py-2 px-4 border-b">
                  <input
                    type="checkbox"
                    checked={state.selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.role}</td>
                <td className="py-2 px-4 border-b">{user.status}</td>
                <td className="py-2 px-4 border-b">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={() => handleOpenDetail(user)}>View</button>
                  {/* Add more actions here if needed */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions */}
      <div className="mt-4">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleBulkDelete}
          disabled={state.selectedUsers.length === 0}
        >
          Delete Selected
        </button>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
          onClick={() => handlePageChange(state.currentPage - 1)}
          disabled={state.currentPage === 1}
        >
          Prev
        </button>
        {range(1, totalPages).map((page) => (
          <button
            key={page}
            className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 ${state.currentPage === page ? 'bg-blue-500 text-white' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
          onClick={() => handlePageChange(state.currentPage + 1)}
          disabled={state.currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/*User Detail Modal*/}
      {state.userDetail && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      User Details
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        <strong>Name:</strong> {state.userDetail.name}
                        <br />
                        <strong>Email:</strong> {state.userDetail.email}
                        <br />
                        <strong>Role:</strong> {state.userDetail.role}
                        <br />
                        <strong>Status:</strong> {state.userDetail.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={handleCloseDetail}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default UserManagementTable;