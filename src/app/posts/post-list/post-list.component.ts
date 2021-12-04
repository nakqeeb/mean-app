import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string;
  private postsSub: Subscription;
  private authListenerSub: Subscription;
  /* = [
    {title: 'First Post', content: 'This is first post content!'},
    {title: 'Second Post', content: 'This is second post content!'},
    {title: 'Third Post', content: 'This is third post content!'}
  ]; */

  constructor(
    private postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId(); // lecture 118
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[]; postCount: number }) => {
        // ^^the name of the (posts & postCount) properties should be same as declared  in the subject type in 'posts.service.ts' file
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
      });
    this.authListenerSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId(); // lecture 118
      });
  }

  onChangedPage(pageData: PageEvent) {
    // PageEvent (lecture 88)
    // console.log(pageData);
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1; // we have to add one here because this index starts at zero but on our back-end, we're working with one, two and so on.
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDeletePost(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      // This added from Q&A section
      /* if (this.posts.length === 1 && (this.totalPosts - (this.postsPerPage * this.currentPage)) < this.totalPosts){
        this.currentPage -= 1;
      } */
      // The above and the next if block are performing the same purpose. You can choose any of them
      if (this.posts.length - (1 % this.postsPerPage) === 0) {
        this.currentPage -= 1;
      }
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }, (error => {
      this.isLoading = false; // lecture 126. Just to remove the spinner if we encounter any error when deleting a post
    }));
  }

  ngOnDestroy() {
    if (this.postsSub) {
      this.postsSub.unsubscribe();
    }
    if (this.authListenerSub) {
      this.authListenerSub.unsubscribe();
    }
  }
}
