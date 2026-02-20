$(document).ready(function(){
 try{
 isReady("objetos.CategoriasLista", "CategoriaLateral()");
 } catch (e) { console.log(e.message); }
});
function CategoriaLateral(){
 var LOG = [];
 var obj = jQuery.parseJSON(objetos.CategoriasLista);
 var categoria = obj.Categorias;
 var DepartamentosLateral = Departamentos(categoria, 0, LOG);
 $('#departamentos-lateral').append(DepartamentosLateral);
}
