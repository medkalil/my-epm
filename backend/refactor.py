import os
import shutil

src_dir = 'src/main/java/com/example/demo'
dest_dir = 'src/main/java/com/projectmanagement'

mapping = {
    'DemoApplication.java': 'EpmApplication.java',
    
    'model/User.java': 'auth/entity/User.java',
    'model/auth/RefreshToken.java': 'auth/entity/RefreshToken.java',
    
    'repository/UserRepository.java': 'auth/repository/UserRepository.java',
    'repository/auth/RefreshTokenRepository.java': 'auth/repository/RefreshTokenRepository.java',
    
    'service/UserService.java': 'auth/service/UserService.java',
    'service/impl/UserServiceImpl.java': 'auth/service/impl/UserServiceImpl.java',
    'service/auth/RefreshTokenService.java': 'auth/service/RefreshTokenService.java',
    
    'controller/UserController.java': 'auth/controller/UserController.java',
    'controller/auth/AuthController.java': 'auth/controller/AuthController.java',
    
    'dtos/request/CreateUserRequest.java': 'auth/dto/request/CreateUserRequest.java',
    'dtos/auth/LoginRequest.java': 'auth/dto/request/LoginRequest.java',
    'dtos/auth/RegisterRequest.java': 'auth/dto/request/RegisterRequest.java',
    'dtos/auth/TokenRefreshRequest.java': 'auth/dto/request/TokenRefreshRequest.java',
    
    'dtos/responce/UserResponse.java': 'auth/dto/response/UserResponse.java',
    'dtos/auth/JwtResponse.java': 'auth/dto/response/JwtResponse.java',
    'dtos/auth/TokenRefreshResponse.java': 'auth/dto/response/TokenRefreshResponse.java',
    
    'mappers/UserMapper.java': 'auth/mapper/UserMapper.java',
    
    'exception/TokenRefreshException.java': 'auth/exception/TokenRefreshException.java',
    'exception/UserNotFoundException.java': 'auth/exception/UserNotFoundException.java',
    
    'exception/GlobalExceptionHandler.java': 'common/exception/GlobalExceptionHandler.java',
    
    'security/services/UserDetailsServiceImpl.java': 'auth/security/UserDetailsServiceImpl.java',
    'security/jwt/JwtUtils.java': 'auth/security/JwtUtils.java',
    'security/jwt/AuthTokenFilter.java': 'auth/security/AuthTokenFilter.java',
    'security/jwt/AuthEntryPointJwt.java': 'auth/security/AuthEntryPointJwt.java',
    'security/config/WebSecurityConfig.java': 'auth/security/WebSecurityConfig.java'
}

def fix_imports_and_packages(content, new_package):
    # This is a basic string replacement, we need to handle specific package changes
    content = content.replace('com.example.demo.DemoApplication', 'com.projectmanagement.EpmApplication')
    content = content.replace('com.example.demo', 'com.projectmanagement')
    
    # Specific renamings
    content = content.replace('com.projectmanagement.model.auth.RefreshToken', 'com.projectmanagement.auth.entity.RefreshToken')
    content = content.replace('com.projectmanagement.model.User', 'com.projectmanagement.auth.entity.User')
    
    content = content.replace('com.projectmanagement.repository.auth.RefreshTokenRepository', 'com.projectmanagement.auth.repository.RefreshTokenRepository')
    content = content.replace('com.projectmanagement.repository.UserRepository', 'com.projectmanagement.auth.repository.UserRepository')
    
    content = content.replace('com.projectmanagement.service.auth.RefreshTokenService', 'com.projectmanagement.auth.service.RefreshTokenService')
    content = content.replace('com.projectmanagement.service.UserService', 'com.projectmanagement.auth.service.UserService')
    content = content.replace('com.projectmanagement.service.impl.UserServiceImpl', 'com.projectmanagement.auth.service.impl.UserServiceImpl')
    
    content = content.replace('com.projectmanagement.controller.auth.AuthController', 'com.projectmanagement.auth.controller.AuthController')
    content = content.replace('com.projectmanagement.controller.UserController', 'com.projectmanagement.auth.controller.UserController')
    
    content = content.replace('com.projectmanagement.dtos.request.CreateUserRequest', 'com.projectmanagement.auth.dto.request.CreateUserRequest')
    content = content.replace('com.projectmanagement.dtos.auth.LoginRequest', 'com.projectmanagement.auth.dto.request.LoginRequest')
    content = content.replace('com.projectmanagement.dtos.auth.RegisterRequest', 'com.projectmanagement.auth.dto.request.RegisterRequest')
    content = content.replace('com.projectmanagement.dtos.auth.TokenRefreshRequest', 'com.projectmanagement.auth.dto.request.TokenRefreshRequest')
    
    content = content.replace('com.projectmanagement.dtos.responce.UserResponse', 'com.projectmanagement.auth.dto.response.UserResponse')
    content = content.replace('com.projectmanagement.dtos.auth.JwtResponse', 'com.projectmanagement.auth.dto.response.JwtResponse')
    content = content.replace('com.projectmanagement.dtos.auth.TokenRefreshResponse', 'com.projectmanagement.auth.dto.response.TokenRefreshResponse')
    
    content = content.replace('com.projectmanagement.mappers.UserMapper', 'com.projectmanagement.auth.mapper.UserMapper')
    
    content = content.replace('com.projectmanagement.exception.TokenRefreshException', 'com.projectmanagement.auth.exception.TokenRefreshException')
    content = content.replace('com.projectmanagement.exception.UserNotFoundException', 'com.projectmanagement.auth.exception.UserNotFoundException')
    content = content.replace('com.projectmanagement.exception.GlobalExceptionHandler', 'com.projectmanagement.common.exception.GlobalExceptionHandler')
    
    content = content.replace('com.projectmanagement.security.services.UserDetailsServiceImpl', 'com.projectmanagement.auth.security.UserDetailsServiceImpl')
    content = content.replace('com.projectmanagement.security.jwt.JwtUtils', 'com.projectmanagement.auth.security.JwtUtils')
    content = content.replace('com.projectmanagement.security.jwt.AuthTokenFilter', 'com.projectmanagement.auth.security.AuthTokenFilter')
    content = content.replace('com.projectmanagement.security.jwt.AuthEntryPointJwt', 'com.projectmanagement.auth.security.AuthEntryPointJwt')
    content = content.replace('com.projectmanagement.security.config.WebSecurityConfig', 'com.projectmanagement.auth.security.WebSecurityConfig')

    # Fix package declarations
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if line.startswith('package '):
            lines[i] = f'package {new_package};'
            break
            
    # Fix class name for DemoApplication
    if 'class DemoApplication' in content:
        lines = [line.replace('class DemoApplication', 'class EpmApplication') for line in lines]
        lines = [line.replace('DemoApplication.class', 'EpmApplication.class') for line in lines]
            
    return '\n'.join(lines)

for old_path, new_path in mapping.items():
    full_old = os.path.join(src_dir, old_path)
    full_new = os.path.join(dest_dir, new_path)
    
    if os.path.exists(full_old):
        os.makedirs(os.path.dirname(full_new), exist_ok=True)
        with open(full_old, 'r') as f:
            content = f.read()
            
        new_package = 'com.projectmanagement.' + os.path.dirname(new_path).replace('/', '.')
        if new_package.endswith('.'):
            new_package = new_package[:-1]
            
        new_content = fix_imports_and_packages(content, new_package)
        
        with open(full_new, 'w') as f:
            f.write(new_content)
        print(f"Moved and updated {full_old} -> {full_new}")
    else:
        print(f"File not found: {full_old}")

