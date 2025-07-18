import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, CheckCircle, LogOut, User, Shield } from 'lucide-react';
import './App.css';

function App() {
  // Estado de autenticación
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Usuarios en estado para poder agregar dinámicamente
  const [usersList, setUsersList] = useState(() => {
    const savedUsers = localStorage.getItem('usersList');
    return savedUsers ? JSON.parse(savedUsers) : [
      { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador' },
      { id: 2, username: 'usuario', password: 'user123', role: 'user', name: 'Usuario Consulta' },
      { id: 3, username: 'gerente', password: 'gerente123', role: 'admin', name: 'Gerente' },
      { id: 4, username: 'operador', password: 'operador123', role: 'user', name: 'Operador' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('usersList', JSON.stringify(usersList));
  }, [usersList]);

  // Estado para formulario de añadir usuario
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user'
  });

  // Estado para mensajes en modal añadir usuario
  const [message, setMessage] = useState({ text: '', type: '' });

  // Estado para controlar visibilidad tabla usuarios
  const [showUsersTable, setShowUsersTable] = useState(false);

  // Estado para usuario en edición
  const [editingUser, setEditingUser] = useState(null);

  // Productos y demás estados
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Auriculares Bluetooth Pro',
      category: 'Equipos de Audio',
      quantity: 25,
      minStock: 10,
      price: 89.99,
      supplier: 'TechSupply Co.',
      dateAdded: '2024-01-15',
      location: 'Almacén A-1'
    },
    {
      id: 2,
      name: 'Micrófono USB HD',
      category: 'Equipos de Audio',
      quantity: 8,
      minStock: 15,
      price: 45.50,
      supplier: 'AudioTech Ltd.',
      dateAdded: '2024-01-10',
      location: 'Almacén A-2'
    },
    {
      id: 3,
      name: 'Webcam 4K',
      category: 'Video',
      quantity: 15,
      minStock: 5,
      price: 120.00,
      supplier: 'VideoPlus Inc.',
      dateAdded: '2024-01-20',
      location: 'Almacén B-1'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    minStock: '',
    price: '',
    supplier: '',
    location: ''
  });

  // Estado para mensajes en modal producto
  const [productMessage, setProductMessage] = useState({ text: '', type: '' });

  const categories = ['Equipos de Audio', 'Video', 'Telefonía', 'Computadoras', 'Accesorios', 'Software'];

  // Función para login
  const handleLogin = () => {
    const foundUser = usersList.find(u =>
      u.username === loginForm.username && u.password === loginForm.password
    );
    if (foundUser) {
      setUser(foundUser);
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  };

  // Función para logout
  const handleLogout = () => {
    setUser(null);
    setShowForm(false);
    setEditingProduct(null);
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => user && user.role === 'admin';

  // Función para añadir o editar usuario (solo admin)
  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      setMessage({ text: 'Completa todos los campos', type: 'error' });
      return;
    }
    const usernameExists = usersList.some(u => u.username === newUser.username && u.id !== (editingUser?.id || 0));
    if (usernameExists) {
      setMessage({ text: 'El usuario ya existe', type: 'error' });
      return;
    }

    if (editingUser) {
      setUsersList(usersList.map(u =>
        u.id === editingUser.id ? { ...u, ...newUser } : u
      ));
      setMessage({ text: 'Usuario actualizado correctamente', type: 'success' });
    } else {
      setUsersList([
        ...usersList,
        {
          id: Date.now(),
          ...newUser
        }
      ]);
      setMessage({ text: 'Usuario guardado correctamente', type: 'success' });
    }

    setNewUser({ username: '', password: '', name: '', role: 'user' });
    setEditingUser(null);

    setTimeout(() => {
      setShowUserForm(false);
      setMessage({ text: '', type: '' });
    }, 2000);
  };

  // Función para abrir modal editar usuario
  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role
    });
    setShowUserForm(true);
    setMessage({ text: '', type: '' });
  };

  // Función para eliminar usuario
  const handleDeleteUser = (id) => {
    if (!isAdmin()) {
      alert('No tienes permisos para eliminar usuarios');
      return;
    }
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      setUsersList(usersList.filter(user => user.id !== id));
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Estadísticas
  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.quantity <= p.minStock).length,
    totalValue: products.reduce((sum, p) => sum + (p.quantity * p.price), 0)
  };

  // Resetear formulario producto
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      minStock: '',
      price: '',
      supplier: '',
      location: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  // Guardar producto (nuevo o editar)
  const handleSubmit = () => {
    if (!isAdmin()) {
      setProductMessage({ text: 'No tienes permisos para realizar esta acción', type: 'error' });
      return;
    }
    if (!formData.name || !formData.category || !formData.quantity ||
        !formData.minStock || !formData.price || !formData.supplier || !formData.location) {
      setProductMessage({ text: 'Por favor completa todos los campos', type: 'error' });
      return;
    }
    if (editingProduct) {
      setProducts(products.map(p =>
        p.id === editingProduct.id
          ? {
              ...p,
              ...formData,
              quantity: parseInt(formData.quantity),
              minStock: parseInt(formData.minStock),
              price: parseFloat(formData.price)
            }
          : p
      ));
      setProductMessage({ text: 'Producto actualizado correctamente', type: 'success' });
    } else {
      const newProduct = {
        id: Date.now(),
        ...formData,
        quantity: parseInt(formData.quantity),
        minStock: parseInt(formData.minStock),
        price: parseFloat(formData.price),
        dateAdded: new Date().toISOString().split('T')[0]
      };
      setProducts([...products, newProduct]);
      setProductMessage({ text: 'Producto agregado correctamente', type: 'success' });
    }
    setTimeout(() => {
      resetForm();
      setProductMessage({ text: '', type: '' });
    }, 2000);
  };

  // Editar producto
  const handleEdit = (product) => {
    if (!isAdmin()) {
      alert('No tienes permisos para editar productos');
      return;
    }
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      quantity: product.quantity.toString(),
      minStock: product.minStock.toString(),
      price: product.price.toString(),
      supplier: product.supplier,
      location: product.location
    });
    setShowForm(true);
  };

  // Eliminar producto
  const handleDelete = (id) => {
    if (!isAdmin()) {
      alert('No tienes permisos para eliminar productos');
      return;
    }
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Estado de stock
  const getStockStatus = (quantity, minStock) => {
    if (quantity === 0) return { status: 'Sin Stock', color: 'text-red-600', icon: AlertTriangle };
    if (quantity <= minStock) return { status: 'Stock Bajo', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'Stock OK', color: 'text-green-600', icon: CheckCircle };
  };

  // Renderizar pantalla login si no hay usuario
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Package className="text-blue-600 mr-2" size={32} />
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">Sistema de Inventario</h1>
            </div>
            <p className="text-gray-600">Centro de Contacto | Vincco | Gestión de Productos</p>
          </div>
          <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleLogin(); }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Ingresa tu usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Ingresa tu contraseña"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Iniciar Sesión
            </button>
          </form>
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Usuarios de prueba:</h3>
            <div className="text-xs text-gray-600 space-y-2">
              <div className="flex justify-between"><span><strong>Administrador:</strong></span><span>admin / admin123</span></div>
              <div className="flex justify-between"><span><strong>Usuario:</strong></span><span>usuario / user123</span></div>
              <div className="flex justify-between"><span><strong>Gerente:</strong></span><span>gerente / gerente123</span></div>
              <div className="flex justify-between"><span><strong>Operador:</strong></span><span>operador / operador123</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar pantalla principal
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="text-blue-600" />
                Sistema de Inventario
              </h1>
              <p className="text-gray-600">Centro de Contacto - Gestión de Productos</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                {isAdmin() ? (
                  <Shield className="text-green-600" size={20} />
                ) : (
                  <User className="text-blue-600" size={20} />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.name} ({isAdmin() ? 'Administrador' : 'Usuario'})
                </span>
              </div>

              {/* Botones para usuarios */}
              {isAdmin() && (
                <>
                  <button
                    onClick={() => setShowUserForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus size={20} />
                    Añadir Usuario
                  </button>

                  <button
                    onClick={() => setShowUsersTable(prev => !prev)}
                    className="bg-gray-600 hover:bg-gray-700 text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    {showUsersTable ? 'Ocultar Usuarios' : 'Mostrar Usuarios'}
                  </button>
                </>
              )}

              {/* Botón agregar producto solo admin */}
              {isAdmin() && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus size={20} />
                  Agregar Producto
                </button>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut size={20} />
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600">Total Productos</h3>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-600">Stock Bajo</h3>
              <p className="text-2xl font-bold text-yellow-900">{stats.lowStock}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600">Valor Total</h3>
              <p className="text-2xl font-bold text-green-900">${stats.totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Tabla de usuarios solo visible para admin y controlada por showUsersTable */}
        {isAdmin() && showUsersTable && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold mb-2">Usuarios del sistema</h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">Nombre</th>
                  <th className="text-left py-2">Usuario</th>
                  <th className="text-left py-2">Rol</th>
                  <th className="text-left py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id}>
                    <td className="py-1">{u.name}</td>
                    <td className="py-1">{u.username}</td>
                    <td className="py-1">{u.role === 'admin' ? 'Administrador' : 'Visualizador'}</td>
                    <td className="py-1">
                      <button
                        onClick={() => handleEditUser(u)}
                        className="text-blue-600 hover:text-blue-900 font-semibold mr-4"
                        title="Modificar usuario"
                      >
                        Modificar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-600 hover:text-red-900 font-semibold"
                        title="Eliminar usuario"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal para añadir/editar usuario */}
        {showUserForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingUser ? 'Editar Usuario' : 'Añadir Usuario'}
                </h2>

                {/* Mensaje */}
                {message.text && (
                  <div
                    className={`mb-4 px-4 py-2 rounded ${
                      message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={newUser.name}
                      onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                    <input
                      type="text"
                      placeholder="Usuario"
                      value={newUser.username}
                      onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                      type="password"
                      placeholder="Contraseña"
                      value={newUser.password}
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="admin">Administrador</option>
                      <option value="user">Visualizador</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserForm(false);
                      setMessage({ text: '', type: '' });
                      setEditingUser(null);
                      setNewUser({ username: '', password: '', name: '', role: 'user' });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddUser}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingUser ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar productos o proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Productos */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  {isAdmin() && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map(product => {
                  const stockStatus = getStockStatus(product.quantity, product.minStock);
                  const StatusIcon = stockStatus.icon;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">Agregado: {product.dateAdded}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.quantity} unidades</div>
                        <div className="text-xs text-gray-500">Min: {product.minStock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-1 ${stockStatus.color}`}>
                          <StatusIcon size={16} />
                          <span className="text-sm font-medium">{stockStatus.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.location}
                      </td>
                      {isAdmin() && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                              title="Editar producto"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron productos</h3>
                <p className="mt-1 text-sm text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Formulario producto (solo admin) */}
        {showForm && isAdmin() && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                </h2>

                {/* Mensaje de producto */}
                {productMessage.text && (
                  <div
                    className={`mb-4 px-4 py-2 rounded ${
                      productMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {productMessage.text}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.minStock}
                        onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                    <input
                      type="text"
                      required
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setProductMessage({ text: '', type: '' });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingProduct ? 'Actualizar' : 'Agregar'} Producto
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
