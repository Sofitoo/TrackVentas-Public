import React from 'react';


const home: React.FC = () => {
    return (
      <div className='contenedor-texto-flotante'>
        <p className='texto-flotante'>TrackVentas</p>
        <div className='home-container'>
           <img
        src="./public/imagenes/logo.jpg" // 👈 Ruta de tu imagen (puede ser distinta)
        alt="Fondo de inicio"
        className="home-image"
      />
        </div>
        </div>
    );
};

export default home;