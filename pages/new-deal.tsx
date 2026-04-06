import dynamic from 'next/dynamic';

const NewDealComp = dynamic(() => import('../src/components/NewDealPage'), { ssr: false });

export default function NewDealRoute() {
  return <NewDealComp />;
}

export async function getServerSideProps() {
  return { props: {} };
}
