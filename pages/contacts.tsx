import dynamic from 'next/dynamic';

const ContactsComp = dynamic(() => import('../src/components/ContactsPage'), { ssr: false });

export default function ContactsRoute() {
  return <ContactsComp />;
}

export async function getServerSideProps() {
  return { props: {} };
}
