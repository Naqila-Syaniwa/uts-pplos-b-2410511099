<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->get('fields', 'FieldController::index');
$routes->get('fields/(:num)', 'FieldController::show/$1');
$routes->get('schedules', 'FieldController::schedule');