import React from 'react'
import HeroBanner from '../../components/HeroBanner';
import Categories from '../../components/Categories';
import Featured from '../../components/Featured';
import Deals from '../../components/Deals';
import Perks from '../../components/Perks';
const HomePage = () => {
  return (
    <div>
      <HeroBanner />
      <Categories />
      <Featured/>
      <Perks/>
      <Deals />
      
    </div>
  )
}

export default HomePage
