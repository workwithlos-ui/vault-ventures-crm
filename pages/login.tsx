export default function LoginRoute() {
  return null;
}
export async function getServerSideProps() {
  return { redirect: { destination: '/', permanent: false } };
}
