CLASS zcl_custom_signs DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    "! Build a sign that includes both of the parameters.
    METHODS build_sign IMPORTING occasion      TYPE string
                                 name          TYPE string
                       RETURNING VALUE(result) TYPE string.
ENDCLASS.

CLASS zcl_custom_signs IMPLEMENTATION.
  METHOD build_sign.
    "Implement solution here
  ENDMETHOD.
ENDCLASS.