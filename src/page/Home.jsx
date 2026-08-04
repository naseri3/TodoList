import Header from '../components/Header';

const Home = ({ user }) => {
   return (
      <>
         <Header user={user} />

         <main>
            <div>Home</div>
         </main>
      </>
   );
};

export default Home;
