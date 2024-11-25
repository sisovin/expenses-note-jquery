$(document).ready(function () {
  const API_BASE = 'http://localhost:3000';

  function fetchCategories() {
    $.get(`${API_BASE}/categories`, function (data) {
      console.log('Fetched categories:', data);
      $('#categoryTable').empty();
      data.forEach((category) => {
        $('#categoryTable').append(`
          <tr>
            <td>${category.name}</td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="editCategory(${category.id}, '${category.name}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteCategory(${category.id})">Delete</button>
            </td>
          </tr>
        `);
      });
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error('Error fetching categories:', textStatus, errorThrown);
    });
  }

  $('#categoryForm').on('submit', function (e) {
    e.preventDefault();
    const name = $('#name').val();

    $.ajax({
      url: `${API_BASE}/categories`,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ name }),
      success: function () {
        $('#name').val('');
        fetchCategories();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error('Error adding category:', textStatus, errorThrown);
      },
    });
  });

  window.editCategory = function (id, name) {
    const newName = prompt('Enter new name for the category:', name);
    if (newName) {
      $.ajax({
        url: `${API_BASE}/categories/${id}`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ name: newName }),
        success: function () {
          fetchCategories();
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error('Error updating category:', textStatus, errorThrown);
        },
      });
    }
  };

  window.deleteCategory = function (id) {
    if (confirm('Are you sure you want to delete this category?')) {
      $.ajax({
        url: `${API_BASE}/categories/${id}`,
        type: 'DELETE',
        success: function () {
          fetchCategories();
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error('Error deleting category:', textStatus, errorThrown);
        },
      });
    }
  };

  fetchCategories();
});
