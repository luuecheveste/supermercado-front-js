import { useState, useEffect } from "react";
import { AuthContext } from "../contexts/auth";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // ✅ cambio para v4
import {API_URL} from "../services/api.js";

// Función para verificar expiración de JWT
function isExpired(exp) {
 return Date.now() / 1000 > exp;
}


// Función para decodificar el JWT y obtener datos del usuario
function getUser(token) {
 if (!token) return null;
 try {
   const decoded = jwtDecode(token);
   if (isExpired(decoded.exp)) return null;


   return {
     id: decoded.id,
     usuario: decoded.usuario,
     name: decoded.name,
     apellido: decoded.apellido,
     rol: decoded.rol,
     zona: decoded.zona,
   };
 } catch (error) {
   console.error("Error decoding JWT:", error);
   return null;
 }
}


// Proveedor de contexto de autenticación
export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(getUser(localStorage.getItem("token")));
 const [distribuidor, setDistribuidor] = useState(null);
 const [wasAuthenticated, setWasAuthenticated] = useState(false);
 const [errorLogin, setErrorLogin] = useState(null);


 // Obtener distribuidor por zona
 const fetchDistribuidor = async (zona) => {
   if (!zona?.id) return null;
   try {
     const response = await axios.get(`${API_URL}/api/distribuidor/zona/${zona.id}`, {
       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
     });
     return response.data.data?.[0] || null;
   } catch (error) {
     console.error("Error al obtener distribuidor:", error);
     return null;
   }
 };


 // Cargar distribuidor cuando cambia el usuario
 useEffect(() => {
   const loadDistribuidor = async () => {
     if (user?.zona) {
       const distribuidorData = await fetchDistribuidor(user.zona);
       setDistribuidor(distribuidorData);
     }
   };
   loadDistribuidor();
 }, [user]);


 const isAuthenticated = () => !!getUser(localStorage.getItem("token"));


 const login = async (userData) => {
   setErrorLogin(null);
   try {
     const response = await axios.post(`${API_URL}/api/auth/login`, userData);
     const token = response.data.token;
     localStorage.setItem("token", token);
     const loggedUser = getUser(token);
     setUser(loggedUser);
     setWasAuthenticated(true);


     if (loggedUser?.zona) {
       const distribuidorData = await fetchDistribuidor(loggedUser.zona);
       setDistribuidor(distribuidorData);
     }
   } catch (error) {
     console.error("Login error:", error);
     setErrorLogin(error.response?.data?.message || "Error al iniciar sesión");
   }
 };


 const registerUser = async (userData) => {
   setErrorLogin(null);
   try {
     const response = await axios.post(`${API_URL}/api/auth/register`, userData);
     return { success: true, data: response.data };
   } catch (error) {
     console.error("Error registrando usuario:", error);
     const message = error.response?.data?.message || "Error al registrar usuario";
     setErrorLogin(message);
     return { success: false, message };
   }
 };


 const logout = () => {
   setUser(null);
   setDistribuidor(null);
   localStorage.removeItem("token");
   setWasAuthenticated(false);
 };


 const authValue = {
   isAuthenticated,
   user,
   distribuidor,
   login,
   registerUser,
   logout,
   wasAuthenticated,
   errorLogin,
 };


 return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};