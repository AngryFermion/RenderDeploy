import React, { useState } from 'react';

const ImageSlider = ({ images }) => {

  const [currentIndex, setCurrentIndex] = useState(0);
  let [slidesCount, setSlidesCount] = useState(0);
  let [slideContents,SetSlideContents] =useState([]);

  const previous = "<";
  const next = ">";

  const goToNextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPreviousImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
       <div className='modal-overlay'> 
          <div className='Slide-Container-Modal'>
              <div className="slider-Header">
                   <span className='slider-Count'>Image-{currentIndex+1}</span>
              </div>
      
      <div className="image-slider-container">
           <img src={images[currentIndex]} alt="slider" className="slider-image" />
           <button className="prev-button" onClick={goToPreviousImage}>{previous}</button>
           <button className="next-button" onClick={goToNextImage}>{next}</button>
           
           <div className="slider-Contents">
                   <span className='slider-Contents'>{slideContents}</span>
           </div>
      </div>
          </div>
     </div>
  );
};

export default ImageSlider;
