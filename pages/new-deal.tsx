import NewDealPage from '../src/components/NewDealPage';
export default function NewDealRoute() {
  return <NewDealPage />;
}
export async function getServerSideProps() {
  return { props: {} };
}
