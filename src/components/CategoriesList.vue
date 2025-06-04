<template>
  <div class="container">
    <h2 class="title">Lista kategorija filmova</h2>

    <!-- Notification message -->
    <div v-if="message" :class="['notification', messageType]">
      {{ message }}
    </div>

    <!-- Add form -->
    <form @submit.prevent="createCategory" class="add-form">
      <input v-model.trim="newCategory" placeholder="Nova kategorija" class="form-input" />
      <button type="submit" class="btn btn-primary" :disabled="loadingCreate">
        {{ loadingCreate ? 'Dodavanje...' : 'Dodaj' }}
      </button>
    </form>

    <!-- Loading state -->
    <div v-if="loading" class="loading">Učitavanje...</div>

    <!-- Categories table -->
    <div v-else>
      <table class="categories-table">
        <thead>
          <tr>
            <th>Naziv kategorije</th>
            <th>Zadnja promjena</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.category_id">
            <td v-if="editingId !== category.category_id">{{ category.name }}</td>
            <td v-else>
              <input v-model.trim="editedName" class="form-input" />
            </td>
            
            <td>
              {{ new Date(category.last_update).toLocaleString('hr-HR', { dateStyle: 'medium', timeStyle: 'short' }) }}
            </td>
            
            <td class="actions">
              <div v-if="editingId !== category.category_id">
                <button @click="startEdit(category)" class="btn btn-edit">Uredi</button>
                <button
                  @click="deleteCategory(category.category_id)"
                  class="btn btn-delete"
                  :disabled="loadingDeleteId === category.category_id"
                >
                  {{ loadingDeleteId === category.category_id ? 'Brisanje...' : 'Obriši' }}
                </button>
              </div>
              
              <div v-else>
                <button
                  @click="updateCategory(category.category_id)"
                  class="btn btn-save"
                  :disabled="loadingUpdate"
                >
                  {{ loadingUpdate ? 'Spremanje...' : 'Spremi' }}
                </button>
                <button @click="cancelEdit" class="btn btn-cancel">Odustani</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'CategoriesList',
  data() {
    return {
      categories: [],
      loading: true,
      loadingCreate: false,
      loadingUpdate: false,
      loadingDeleteId: null,
      newCategory: '',
      editingId: null,
      editedName: '',
      message: '',
      messageType: ''
    }
  },
  mounted() {
    this.getCategories()
  },
  methods: {
    async getCategories() {
      this.loading = true
      try {
        const response = await api.get('/categories')
        this.categories = response.data
      } catch (error) {
        this.showMessage('Greška pri dohvaćanju kategorija.', 'error')
      } finally {
        this.loading = false
      }
    },
    async createCategory() {
      if (!this.newCategory) {
        return this.showMessage('Unesite naziv kategorije.', 'error')
      }
      this.loadingCreate = true
      try {
        const response = await api.post('/categories', {
          name: this.newCategory,
          last_update: new Date().toISOString()
        })
        this.categories.push(response.data.category)
        this.newCategory = ''
        this.showMessage('Kategorija je uspješno dodana.', 'success')
      } catch (error) {
        this.showMessage('Greška pri dodavanju kategorije.', 'error')
      } finally {
        this.loadingCreate = false
      }
    },
    startEdit(category) {
      this.editingId = category.category_id
      this.editedName = category.name
    },
    cancelEdit() {
      this.editingId = null
      this.editedName = ''
    },
    async updateCategory(id) {
      if (!this.editedName) {
        return this.showMessage('Unesite naziv za ažuriranje.', 'error')
      }
      this.loadingUpdate = true
      try {
        const response = await api.put(`/categories/${id}`, {
          name: this.editedName
        })
        const index = this.categories.findIndex(cat => cat.category_id === id)
        if (index !== -1) {
          this.categories[index] = response.data.category
        }
        this.cancelEdit()
        this.showMessage('Kategorija je ažurirana.', 'success')
      } catch (error) {
        this.showMessage('Greška pri ažuriranju kategorije.', 'error')
      } finally {
        this.loadingUpdate = false
      }
    },
    async deleteCategory(id) {
      if (!confirm('Jesi li sigurna da želiš obrisati ovu kategoriju?')) return
      this.loadingDeleteId = id
      try {
        await api.delete(`/categories/${id}`)
        this.categories = this.categories.filter(cat => cat.category_id !== id)
        this.showMessage('Kategorija je obrisana.', 'success')
      } catch (error) {
        this.showMessage('Greška pri brisanju kategorije.', 'error')
      } finally {
        this.loadingDeleteId = null
      }
    },
    showMessage(msg, type) {
      this.message = msg
      this.messageType = type
      setTimeout(() => {
        this.message = ''
      }, 4000)
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.notification {
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.notification.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notification.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.add-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  flex-grow: 1;
  min-width: 300px;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.categories-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
}

.categories-table th,
.categories-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.categories-table th {
  background-color: #3498db;
  color: white;
  font-weight: 600;
}

.categories-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

.categories-table tr:hover {
  background-color: #f1f8fe;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-edit {
  background-color: #3498db;
  color: white;
}

.btn-edit:hover:not(:disabled) {
  background-color: #3498db;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-save {
  background-color: #2ecc71;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #27ae60;
}

.btn-cancel {
  background-color: #95a5a6;
  color: white;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #7f8c8d;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .categories-table {
    display: block;
    overflow-x: auto;
  }
  
  .add-form {
    flex-direction: column;
  }
  
  .form-input {
    min-width: auto;
    width: 100%;
  }
}
</style>