<template>
  <div class="container">
    <h2 class="title">Lista zemalja</h2>

    <div v-if="message" :class="['notification', messageType]">
      {{ message }}
    </div>

    <form @submit.prevent="createCountry" class="add-form">
      <input v-model.trim="newCountry" placeholder="Nova zemlja" class="form-input" />
      <button type="submit" class="btn btn-primary" :disabled="loadingCreate">
        {{ loadingCreate ? 'Dodavanje...' : 'Dodaj' }}
      </button>
    </form>

    <div v-if="loading" class="loading">Učitavanje...</div>

    <div v-else>
      <table class="categories-table">
        <thead>
          <tr>
            <th>Naziv zemlje</th>
            <th>Zadnja promjena</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="country in countries" :key="country.country_id">
            <td v-if="editingId !== country.country_id">{{ country.country }}</td>
            <td v-else>
              <input v-model.trim="editedName" class="form-input" />
            </td>
            <td>
              {{ new Date(country.last_update).toLocaleString('hr-HR', { dateStyle: 'medium', timeStyle: 'short' }) }}
            </td>
            <td class="actions">
              <div v-if="editingId !== country.country_id">
                <button @click="startEdit(country)" class="btn btn-edit">Uredi</button>
                <button @click="deleteCountry(country.country_id)" class="btn btn-delete" :disabled="loadingDeleteId === country.country_id">
                  {{ loadingDeleteId === country.country_id ? 'Brisanje...' : 'Obriši' }}
                </button>
              </div>
              <div v-else>
                <button @click="updateCountry(country.country_id)" class="btn btn-save" :disabled="loadingUpdate">
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
import api from '../services/api' // Prilagodi putanju ako treba

export default {
  name: 'CountriesList',
  data() {
    return {
      countries: [],
      loading: true,
      loadingCreate: false,
      loadingUpdate: false,
      loadingDeleteId: null,
      newCountry: '',
      editingId: null,
      editedName: '',
      message: '',
      messageType: ''
    }
  },
  mounted() {
    this.getCountries()
  },
  methods: {
    async getCountries() {
      this.loading = true
      try {
        const response = await api.get('/countries')
        this.countries = response.data
      } catch (error) {
        this.showMessage('Greška pri dohvaćanju zemalja.', 'error')
      } finally {
        this.loading = false
      }
    },
    async createCountry() {
      if (!this.newCountry) {
        return this.showMessage('Unesite naziv zemlje.', 'error')
      }
      this.loadingCreate = true
      try {
        const response = await api.post('/countries', {
          country: this.newCountry,
          last_update: new Date().toISOString()
        })
        this.countries.push(response.data.country)
        this.newCountry = ''
        this.showMessage('Zemlja je dodana.', 'success')
      } catch (error) {
        this.showMessage('Greška pri dodavanju zemlje.', 'error')
      } finally {
        this.loadingCreate = false
      }
    },
    startEdit(country) {
      this.editingId = country.country_id
      this.editedName = country.country
    },
    cancelEdit() {
      this.editingId = null
      this.editedName = ''
    },
    async updateCountry(id) {
      if (!this.editedName) {
        return this.showMessage('Unesite naziv za ažuriranje.', 'error')
      }
      this.loadingUpdate = true
      try {
        const response = await api.put(`/countries/${id}`, {
          country: this.editedName
        })
        const index = this.countries.findIndex(c => c.country_id === id)
        if (index !== -1) {
          this.countries[index] = response.data.country
        }
        this.cancelEdit()
        this.showMessage('Zemlja je ažurirana.', 'success')
      } catch (error) {
        this.showMessage('Greška pri ažuriranju zemlje.', 'error')
      } finally {
        this.loadingUpdate = false
      }
    },
    async deleteCountry(id) {
      if (!confirm('Jesi li sigurna da želiš obrisati ovu zemlju?')) return
      this.loadingDeleteId = id
      try {
        await api.delete(`/countries/${id}`)
        this.countries = this.countries.filter(c => c.country_id !== id)
        this.showMessage('Zemlja je obrisana.', 'success')
      } catch (error) {
        this.showMessage('Greška pri brisanju zemlje.', 'error')
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
