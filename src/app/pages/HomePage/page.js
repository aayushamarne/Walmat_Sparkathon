import React from 'react'
import HeroBanner from '@/app/components/HeroBanner';
import Categories from '@/app/components/Categories';
import Featured from '@/app/components/Featured';
import Deals from '@/app/components/Deals';
import Perks from '@/app/components/Perks';
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
