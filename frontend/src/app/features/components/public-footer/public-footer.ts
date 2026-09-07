import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-public-footer',
  imports: [RouterLink],
  templateUrl: './public-footer.html',
})
export class PublicFooter { readonly anio = new Date().getFullYear(); }
