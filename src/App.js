import React from 'react'
import Treemap from './Treemap'
import data from './Data'
import Navbar from './Navbar'
import Hiskillcop from './Hiskillcop'

function App() {
  return (
    <>
   
    <div style={{
       position:'absolute',
       left:'100px',
       top:'20px'
    }}>

      

      {/* <Treemap data={data} height={400} width={600} />  */}
     <Hiskillcop height={500} width={700}/>
    </div>
    </>

  )
}

export default App
