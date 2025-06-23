import React from 'react'
import HeroBanner from '@/app/components/HeroBanner';
import Categories from '@/app/components/Categories';
import Deals from '@/app/components/Deals';
const HomePage = () => {
  return (
    <div>
         <HeroBanner />
      <Categories />
      <Deals />
      
    </div>
  )
}

export default HomePage
