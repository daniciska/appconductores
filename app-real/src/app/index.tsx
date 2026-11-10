// /: la app real empieza en /conductor (que decide a dónde llevar a cada persona).
import { Redirect } from 'expo-router';

export default function Raiz() {
  return <Redirect href="/conductor" />;
}
