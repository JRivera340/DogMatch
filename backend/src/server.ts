import 'dotenv/config';
import { crearApp } from './app';

const port = Number(process.env.PORT ?? 4000);
const app = crearApp();

app.listen(port, () => {
  console.log(`API escuchando en puerto ${port}`);
});
