import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css'],
})
export class CreateOrderComponent implements OnInit {
  delivery = ['Dine in', 'Take away', 'Delivery'];

  category = [
    'category',
    'category',
    'category',
    'category',
    'category',
    'category',
    'category',
  ];

  constructor() {}

  ngOnInit(): void {}
}
