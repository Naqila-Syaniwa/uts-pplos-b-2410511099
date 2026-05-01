<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\FieldModel;
use App\Models\ScheduleModel;
use CodeIgniter\HTTP\ResponseInterface;

class FieldController extends BaseController
{
    public function index()
    {
        $model = new FieldModel();

        $page = $this->request->getGet('page') ?? 1;
        $perPage = $this->request->getGet('per_page' ?? 10);
        $city = $this->request->getGet('city');

        $query = $model;

        if ($city) {
            $query = $query->where('city', $city);
        }

        $data = $query->paginate($perPage);

        return $this->response->setJSON([
            "data" => $data,
            "pager" => $model->pager->getDetails()
        ]);
    }

    public function show($id) 
    {
        $model = new FieldModel();
        $field = $model->find($id);

        if (!$field) {
            return $this->response->setStatusCode(404)->setJSON([
                "message" => "Field not found"
            ]);
        }

        return $this->response->setJSON($field);
    }

    public function schedules()
    {
        $model = new ScheduleModel();
        return $this->response->setJSON($model->findAll());
    }
}
