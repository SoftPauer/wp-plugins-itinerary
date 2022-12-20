<?php
class ActionResponse {
  // Properties
  public string $status;
  public string $message;
  public string $action;
  public string $identifier;
  

    /**
     */
    public function __construct($status) {
        $this->status = $status;
    }
    public static function createError( string $message, string $action="", string $id = ""){
        $self = new self("Failed");
        $self->message = $message;
        $self->action = $action;
        $self->identifier = $id;
        return $self;
    }

 
    public static function createSuccess( string $action="",string $id = ""){
        $self = new self("Success");
        $self->action = $action;
        $self->identifier = $id;
        return $self;
    }
}