package wire

import (
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
)

type AuthEmailLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (req AuthEmailLoginRequest) Validate() error {
	return validation.ValidateStruct(&req,
		validation.Field(&req.Email, validation.Required, validation.Length(3, 254), is.EmailFormat),
		validation.Field(&req.Password, validation.Required, validation.Length(8, 72)),
	)
}

type AuthEmailRegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (req AuthEmailRegisterRequest) Validate() error {
	return validation.ValidateStruct(&req,
		validation.Field(&req.Email, validation.Required, validation.Length(3, 254), is.EmailFormat),
		validation.Field(&req.Password, validation.Required, validation.Length(8, 72)),
	)
}

type AuthLoginResponse = User
type AuthRegisterResponse = User

type AuthLogoutResponse = Empty
