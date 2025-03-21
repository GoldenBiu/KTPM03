<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'profile_image' => 'nullable|string',
            'bio' => 'nullable|string',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'profile_image' => $request->profile_image,
            'bio' => $request->bio,
            'created_at' => now(),
        ]);

        // Kiểm tra $user trước khi tạo token
        if ($user) {
            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json([
                'status' => 'success',
                'user' => [
                    'user_id' => $user->user_id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'profile_image' => $user->profile_image,
                    'bio' => $user->bio,
                ],
                'token' => $token,
            ], 201);
        }

        return response()->json(['status' => 'error', 'message' => 'Không thể tạo người dùng'], 500);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials = ['email' => $request->email, 'password' => $request->password];

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'user' => [
                    'user_id' => $user->user_id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'profile_image' => $user->profile_image,
                    'bio' => $user->bio,
                ],
                'token' => $token,
            ], 200);
        }

        return response()->json(['status' => 'error', 'message' => 'Email hoặc mật khẩu không đúng'], 401);
    }
}