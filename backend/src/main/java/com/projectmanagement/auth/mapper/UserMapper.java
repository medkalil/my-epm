package com.projectmanagement.auth.mapper;

import org.mapstruct.Mapper;
import com.projectmanagement.auth.entity.User;
import com.projectmanagement.dtos.responce.*;;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}