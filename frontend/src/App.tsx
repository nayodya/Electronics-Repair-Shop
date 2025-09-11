import NavBar from "./components/NavBar/NavBar"
import Footer from "./components/Footer/Footer"
import MainCOntent from "./components/BodyContent/MainContent"
import { AuthProvider } from "./context/AuthContext"

function App() {

  return (
    <>
      <NavBar />
      <AuthProvider>
        <MainCOntent />
      </AuthProvider>
      <Footer />
    </>
  )
}

export default App
