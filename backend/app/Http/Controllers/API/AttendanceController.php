<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkMarkAttendanceRequest;
use App\Http\Requests\GetAttendanceByDateRequest;
use App\Http\Requests\StoreAttendanceRequest;
use App\Http\Requests\UpdateAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\UserResource;
use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class AttendanceController extends Controller
{
    protected function successResponse($data = null, string $message = '', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $status);
    }

    public function bulkStore(BulkMarkAttendanceRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $date = $validated['date'];

        try {
            $ids = [];
            foreach ($validated['records'] as $row) {
                // Front-end might pass user_id or employee_id. We map to employee_id
                $employeeId = (string) ($row['employee_id'] ?? $row['user_id']);

                $attendance = Attendance::query()->updateOrCreate(
                    [
                        'employee_id' => $employeeId,
                        'date' => $date,
                    ],
                    [
                        'status' => $row['status'],
                        'overtime_hours' => $row['overtime_hours'] ?? 0,
                    ]
                );

                $ids[] = $attendance->id;
            }

            $records = Attendance::query()
                ->with([
                    'employee' => static fn ($q) => $q->select('id', 'name', 'email', 'employee_id'),
                ])
                ->whereIn('id', $ids)
                ->orderBy('employee_id')
                ->get();

            return $this->successResponse([
                'date' => $date,
                'records' => AttendanceResource::collection($records)->resolve(),
            ], 'Attendance saved successfully');
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'data' => null,
                'message' => config('app.debug') ? $e->getMessage() : 'Unable to save attendance.',
            ], 500);
        }
    }

    public function byDate(GetAttendanceByDateRequest $request): JsonResponse
    {
        $date = $request->validated('date');

        $records = Attendance::query()
            ->with([
                'employee' => static fn ($q) => $q->select('id', 'name', 'email', 'employee_id'),
            ])
            ->forDate($date)
            ->orderBy('employee_id')
            ->get();

        return $this->successResponse([
            'date' => $date,
            'records' => AttendanceResource::collection($records)->resolve(),
        ]);
    }

    public function history(string $employeeId): JsonResponse
    {
        $employee = Employee::query()
            ->select(['id', 'name', 'email', 'created_at', 'updated_at'])
            ->findOrFail($employeeId);

        $records = Attendance::query()
            ->where('employee_id', $employee->id)
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();

        return $this->successResponse([
            'employee' => (new UserResource($employee))->resolve(),
            'summary' => [
                'total_present' => $records->where('status', 'present')->count(),
                'total_absent' => $records->where('status', 'absent')->count(),
                'total_half_days' => $records->where('status', 'half-day')->count(),
                'total_overtime' => round((float) $records->sum('overtime_hours'), 2),
            ],
            'records' => AttendanceResource::collection($records)->resolve(),
        ]);
    }

    public function index(Request $request)
    {
        $query = Attendance::query()
            ->with([
                'employee' => static fn ($q) => $q->select('id', 'name', 'email', 'employee_id'),
            ])
            ->orderByDesc('date')
            ->orderByDesc('id');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->input('employee_id'));
        } elseif ($request->filled('user_id')) {
            $query->where('employee_id', $request->input('user_id'));
        }

        if ($request->filled('date')) {
            $query->forDate((string) $request->input('date'));
        }

        return AttendanceResource::collection($query->paginate(15));
    }

    public function store(StoreAttendanceRequest $request)
    {
        $validated = $request->validated();
        $employeeId = $validated['employee_id'] ?? $validated['user_id'];

        $attendance = Attendance::query()->updateOrCreate(
            [
                'employee_id' => $employeeId,
                'date' => $validated['date'],
            ],
            [
                'status' => $validated['status'],
                'overtime_hours' => $validated['overtime_hours'] ?? 0,
            ]
        );

        $attendance->load([
            'employee' => static fn ($q) => $q->select('id', 'name', 'email', 'employee_id'),
        ]);

        return response()->json([
            'message' => 'Attendance marked',
            'attendance' => (new AttendanceResource($attendance))->resolve(),
        ]);
    }

    public function show(string $id)
    {
        $attendance = Attendance::query()
            ->with([
                'employee' => static fn ($q) => $q->select('id', 'name', 'email', 'employee_id'),
            ])
            ->findOrFail($id);

        return response()->json((new AttendanceResource($attendance))->resolve());
    }

    public function update(UpdateAttendanceRequest $request, string $id)
    {
        $validated = $request->validated();
        $employeeId = $validated['employee_id'] ?? $validated['user_id'];

        $attendance = Attendance::query()->findOrFail($id);
        $attendance->update([
            'employee_id' => $employeeId,
            'date' => $validated['date'],
            'status' => $validated['status'],
            'overtime_hours' => $validated['overtime_hours'] ?? 0,
        ]);

        $attendance->load([
            'employee' => static fn ($q) => $q->select('id', 'name', 'email', 'employee_id'),
        ]);

        return response()->json([
            'message' => 'Attendance updated',
            'attendance' => (new AttendanceResource($attendance))->resolve(),
        ]);
    }

    public function destroy(string $id)
    {
        $attendance = Attendance::query()->findOrFail($id);
        $attendance->delete();

        return response()->json(['message' => 'Attendance deleted']);
    }
}
