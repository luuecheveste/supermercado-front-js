import { useForm } from "react-hook-form";
import useProducts from "../../hooks/useProducts";
import useCategoria from "../../hooks/useCategoria";
import "./NuevosProductos.css";


const NuevoProducto = () => {
 const { createProduct, uploadImage, updateProduct } = useProducts();
 const { categorias, isLoading: loadingCategorias, isError: categoriasError, error } = useCategoria();


 const {
   register,
   handleSubmit,
   reset,
   formState: { errors, isSubmitting },
 } = useForm();


 const onSubmit = async (data) => {
   try {
     // 1) Crear el producto sin imagen
     const productoData = {
       name: data.name,
       descripcion: data.descripcion,
       categoria: Number(data.categoria),
       precio: parseFloat(String(data.precio).replace(",", ".")),
       stock: Number(data.stock),
       estado: true,
       imagen: "", // se actualizará después
     };
      const productResponse = await createProduct(productoData);
     const productId = productResponse?.data?.id || productResponse?.id;
      if (!productId) throw new Error("No se pudo obtener el ID del producto");
      // 2) Subir la imagen si existe
     let imageUrl = "";
     if (data.imagen && data.imagen[0]) {
       const uploadResult = await uploadImage(data.imagen[0]);
       imageUrl = uploadResult?.filename ? `/imagenes/${uploadResult.filename}` : "";
     }
      // 3) Actualizar el producto con la imagen
     if (imageUrl) {
       await updateProduct(productId, { imagen: imageUrl });
     }
      alert("Producto creado con éxito");
     reset();
   } catch (err) {
     console.error("Error al crear producto:", err);
     alert("Error al crear el producto");
   }
 };
 


 return (
   <div className="nuevo-producto-container">
     <h1>Agregar Nuevo Producto</h1>


     <form className="nuevo-producto-form" onSubmit={handleSubmit(onSubmit)} noValidate>
       {/* Nombre */}
       <div className="form-group">
         <label>Nombre:</label>
         <input
           type="text"
           placeholder="Nombre del producto"
           {...register("name", { required: "El nombre es obligatorio" })}
         />
         {errors.name && <p className="error-message">{errors.name.message}</p>}
       </div>


       {/* Descripción */}
       <div className="form-group">
         <label>Descripción:</label>
         <textarea
           placeholder="Descripción del producto"
           {...register("descripcion", { required: "La descripción es obligatoria" })}
         />
         {errors.descripcion && <p className="error-message">{errors.descripcion.message}</p>}
       </div>


       {/* Categoría */}
       <div className="form-group">
         <label>Categoría:</label>
         {loadingCategorias ? (
           <p>Cargando categorías...</p>
         ) : categoriasError ? (
           <p className="error-message">{error?.message || "Error al cargar categorías"}</p>
         ) : (
           <select
             {...register("categoria", {
               required: "Debe seleccionar una categoría",
               validate: (value) => value !== "" || "Debe seleccionar una categoría",
             })}
           >
             <option value="">Seleccione una categoría</option>
             {Array.isArray(categorias) &&
               categorias.map((cat) => (
                 <option key={cat.id} value={cat.id}>
                   {cat.name || cat.nombre}
                 </option>
               ))}
           </select>
         )}
         {errors.categoria && <p className="error-message">{errors.categoria.message}</p>}
       </div>


       {/* Precio */}
       <div className="form-group">
         <label>Precio:</label>
         <input
           type="number"
           step="any"
           inputMode="decimal"
           placeholder="Precio"
           {...register("precio", {
             required: "Debe ingresar un precio",
             min: { value: 0, message: "El precio no puede ser negativo" },
           })}
         />
         {errors.precio && <p className="error-message">{errors.precio.message}</p>}
       </div>


       {/* Imagen */}
       <div className="form-group">
         <label>Imagen:</label>
         <input type="file" {...register("imagen")} accept="image/*" />
       </div>


       {/* Stock */}
       <div className="form-group">
         <label>Stock:</label>
         <input
           type="number"
           min="0"
           placeholder="Stock disponible"
           {...register("stock", {
             required: "Debe ingresar el stock",
             min: { value: 0, message: "El stock no puede ser negativo" },
           })}
         />
         {errors.stock && <p className="error-message">{errors.stock.message}</p>}
       </div>


       <button type="submit" disabled={isSubmitting || loadingCategorias || categoriasError}>
         {isSubmitting ? "Creando..." : "Crear Producto"}
       </button>
     </form>
   </div>
 );
};


export default NuevoProducto;
