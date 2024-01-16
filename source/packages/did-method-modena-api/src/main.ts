import { NestFactory } from '@nestjs/core';
import { AppModule } from './modena-api.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule , {
    snapshot: true,
  });
  app.enableCors();
  await app.listen(parseInt(process.env.PORT) || 3000);
}
bootstrap();




// Add the --inspect flag to enable debugging
// if (process.env.NODE_ENV === 'development') {
//   require('child_process').exec(`node --inspect=9229 ${process.argv[1]}`, () => {
//     // Continue with the application initialization
//     bootstrap();
//   });
// } else {
// }