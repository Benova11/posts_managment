import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { Post } from './post.model';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts() {
    this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')
      .pipe(map((postData) => {
        return postData.posts.map(post => {
          return{
          title: post.title,
          content: post.content,
          id: post._id
          };
        });
      }))
      .subscribe((transforemdPosts) => {
        this.posts = transforemdPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{_id: string, title: string, content: string}>('http://localhost:3000/api/posts/' + id) ;
  }

  addPost(title: string, content: string) {
    const newPost: Post = {id: null, title, content};
    this.http.post<{message: string, postId: string}>('http://localhost:3000/api/posts', newPost)
      .subscribe(response => {
        const postId = response.postId;
        newPost.id = postId;
        this.posts.push(newPost);
        this.newDataInserted();
      });
  }

  updatePost(id: string, title: string, content: string) {
    const post: Post = {id, title, content};
    this.http.put<Post>('http://localhost:3000/api/posts/' + id, post)
      .subscribe((resData) => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.newDataInserted();
      });
  }

  deletePost(postId: string) {
    this.http.delete('http://localhost:3000/api/posts/' + postId)
      .subscribe(() => {
        const filterdPosts = this.posts.filter(post => post.id !== postId);
        this.posts = filterdPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  newDataInserted() {
    this.postsUpdated.next([...this.posts]);
    this.router.navigate(['/']);
  }

}
