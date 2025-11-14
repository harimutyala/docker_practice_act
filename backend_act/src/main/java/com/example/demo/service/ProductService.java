package com.example.demo.service;

import com.example.demo.model.Product;

import java.util.List;

public interface ProductService {

    Product addProduct(Product product);

    List<Product> getAllProducts();

    Product getProductById(Long id);

    Product updateProduct(Long id, Product product);

    String deleteProduct(Long id);
}
