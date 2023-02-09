import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import * as pactum from 'pactum';
import { AuthSigninDto, AuthSignupDto } from '../src/auth/dto';
import { AuthService } from '../src/auth/auth.service';
import { CreateBlogDto, UpdateBlogDto } from 'src/blog/dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    authService = app.get(AuthService);
    await authService.clean();
    pactum.request.setBaseUrl('http://localhost:3333/api');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const signupDto: AuthSignupDto = {
      name: 'User',
      email: 'user@test.com',
      password: 'pass123',
    };
    const signinDto: AuthSigninDto = {
      email: signupDto.email,
      password: signupDto.password,
    };
    describe('Signup', () => {
      it('should throw if no body', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should throw if no name', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: signupDto.email, password: signupDto.password })
          .expectStatus(400);
      });
      it('should throw if no email', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ name: signupDto.name, password: signupDto.password })
          .expectStatus(400);
      });
      it('should throw if no password', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ name: signupDto.name, email: signupDto.email })
          .expectStatus(400);
      });
      it('should signup a user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(signupDto)
          .expectStatus(201);
      });
      it('should throw if email already exists', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(signupDto)
          .expectStatus(403);
      });
    });
    describe('Signin', () => {
      it('should throw if no body', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('should throw if no email', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: signinDto.password })
          .expectStatus(400);
      });
      it('should throw if no password', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: signinDto.email })
          .expectStatus(400);
      });
      it('should throw if email incorrect', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'random@email.com',
            password: signinDto.password,
          })
          .expectStatus(403);
      });
      it('should throw if password incorrect', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: signinDto.email,
            password: 'randompasword',
          })
          .expectStatus(403);
      });
      it('should signin a user', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(signinDto)
          .stores('token', 'access_token')
          .expectStatus(200);
      });
    });
  });

  describe('Blog', () => {
    const creatBlogDto: CreateBlogDto = {
      title: 'This is my first blog',
      description: 'This is the description for my first blog',
    };
    const updateBlogDto: UpdateBlogDto = {
      title: 'This is the updated title',
      description: 'This is the updated description',
    };
    describe('Get All Blogs', () => {
      it('should get all the blogs[EMPTY ARRAY]', () => {
        return pactum
          .spec()
          .get('/blog')
          .expectStatus(200)
          .expectJsonLike({ blogs: [] })
          .expectJsonLength('blogs', 0)
          .inspect();
      });
    });
    describe('Create Blog', () => {
      it('should throw when creating a blog without access token(LOGGED OUT MODE)', () => {
        return pactum
          .spec()
          .post('/blog')
          .withBody(creatBlogDto)
          .expectStatus(401);
      });
      it('should throw when creating a blog without body', () => {
        return pactum
          .spec()
          .post('/blog')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(400);
      });
      it('should create a blog with the access token', () => {
        return pactum
          .spec()
          .post('/blog')
          .withBody(creatBlogDto)
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .stores('blogId', '_id')
          .expectStatus(201)
          .inspect();
      });
      it('should get all the blogs[1 Blog]', () => {
        return pactum
          .spec()
          .get('/blog')
          .expectStatus(200)
          .expectJsonLength('blogs', 1)
          .inspect();
      });
    });
    describe('Edit Blog', () => {
      it('should throw when updating a blog without access token(LOGGED OUT MODE)', () => {
        return pactum
          .spec()
          .put('/blog/$S{blogId}')
          .withBody(creatBlogDto)
          .expectStatus(401);
      });
      it('should update a blog with the access token', () => {
        return pactum
          .spec()
          .put('/blog/$S{blogId}')
          .withBody(updateBlogDto)
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .inspect();
      });
    });
    describe('Delete Blog', () => {
      it('should throw when deleting a blog without access token(LOGGED OUT MODE)', () => {
        return pactum.spec().delete('/blog/$S{blogId}').expectStatus(401);
      });
      it('should delete a blog with the access token', () => {
        return pactum
          .spec()
          .delete('/blog/$S{blogId}')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200)
          .inspect();
      });
    });
  });
  describe('User', () => {
    describe('Get User Info Along with Blogs', () => {
      it('should throw when trying to get user info without token', () => {
        return pactum.spec().get('/user').expectStatus(401);
      });
      it('should get the user info along with their blogs', () => {
        return pactum
          .spec()
          .get('/user')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200);
      });
    });
  });
});
