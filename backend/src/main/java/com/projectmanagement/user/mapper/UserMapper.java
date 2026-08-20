package com.projectmanagement.user.mapper;

import org.mapstruct.Mapper;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.dto.response.*;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}