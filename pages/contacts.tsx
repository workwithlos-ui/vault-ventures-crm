import ContactsPage from '../src/components/ContactsPage';
export default function ContactsRoute() {
  return <ContactsPage />;
}
export async function getServerSideProps() {
  return { props: {} };
}
