// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract PayrollSystem {
    address public employer;
    mapping(address => uint256) public employeeSalaries;

    constructor() {
        employer = msg.sender;
    }

    function addEmployee(address employee, uint256 salary) public {
        require(msg.sender == employer, "Only employer can add employees.");
        employeeSalaries[employee] = salary;
    }

    function paySalary(address payable employee) public payable {
        require(msg.sender == employer, "Only employer can pay salaries.");
        require(employeeSalaries[employee] > 0, "Employee not found.");

        uint256 salary = employeeSalaries[employee];
        payable(employee).transfer(salary);
    }

    function getSalary(address employee) public view returns (uint256) {
        return employeeSalaries[employee];
    }
}
