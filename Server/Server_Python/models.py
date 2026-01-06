from pydantic import BaseModel, EmailStr, Field, validator

class UserRegisterSchema(BaseModel):
    fullname: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str